# Auto-discovers routes from functions/ folder structure, Next.js-style:
#   functions/bills/GET.js        -> GET /bills
#   functions/bills/[id]/GET.js   -> GET /bills/{id}
#   functions/politicians/GET.js  -> GET /politicians
#
# Each function folder must contain a pre-built function.zip (see GitHub Actions
# workflow / build script - Terraform does not build these, only reads them).

locals {
  functions_root = "${path.module}/../api"

  # every .js handler file under functions/, excluding the shared/ folder
  all_handlers = [
    for f in fileset(local.functions_root, "**/*.js")
    : f
    if !startswith(f, "shared/")
  ]

  # build one route entry per handler file
  # "bills/[id]/GET.js" -> key: "bills-id-GET", method: "GET", path: "/api/bills/{id}"
  #
  # Paths are prefixed with /api because CloudFront forwards the full request
  # path (including /api) to API Gateway - it does not strip the path_pattern
  # prefix automatically. Call these from the frontend as /api/bills, etc.
  flat_routes = {
    for f in local.all_handlers :
    replace(replace(replace(dirname(f), "/", "-"), "[", ""), "]", "") == "" ?
      "root-${trimsuffix(basename(f), ".js")}" :
      "${replace(replace(replace(dirname(f), "/", "-"), "[", ""), "]", "")}-${trimsuffix(basename(f), ".js")}"
    => {
      method    = trimsuffix(basename(f), ".js")
      path      = "/api/${replace(replace(dirname(f), "[", "{"), "]", "}")}"
      file_path = f
    }
  }
}

# --- IAM role every Lambda assumes ---

resource "aws_iam_role" "lambda_exec" {
  name = "${var.bucket_name}-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# --- One Lambda function per route ---

resource "aws_lambda_function" "api" {
  for_each = local.flat_routes

  function_name    = each.key
  runtime          = "nodejs20.x"
  handler          = "${trimsuffix(basename(each.value.file_path), ".js")}.handler"
  filename         = "${local.functions_root}/${dirname(each.value.file_path)}/function.zip"
  source_code_hash = filebase64sha256("${local.functions_root}/${dirname(each.value.file_path)}/function.zip")
  role             = aws_iam_role.lambda_exec.arn
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      PGHOST     = var.pghost
      PGDATABASE = var.pgdatabase
      PGUSER     = var.pguser
      PGPASSWORD = var.pgpassword
    }
  }
}

# --- API Gateway (HTTP API) ---

resource "aws_apigatewayv2_api" "api" {
  name          = "${var.bucket_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["https://${var.domain_name}", "https://www.${var.domain_name}", "http://localhost:3000"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
  }
}

resource "aws_apigatewayv2_stage" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "api" {
  for_each = local.flat_routes

  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api[each.key].invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "api" {
  for_each = local.flat_routes

  api_id    = aws_apigatewayv2_api.api.id
  route_key = "${each.value.method} ${each.value.path}"
  target    = "integrations/${aws_apigatewayv2_integration.api[each.key].id}"
}

resource "aws_lambda_permission" "api" {
  for_each = local.flat_routes

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.api.api_endpoint
}