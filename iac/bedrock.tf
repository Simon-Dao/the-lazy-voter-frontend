resource "aws_iam_user" "bedrock_user" {
  name = "bedrock-api-user"
}

resource "aws_iam_policy" "bedrock_invoke_policy" {
  name = "bedrock-invoke-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "attach" {
  user       = aws_iam_user.bedrock_user.name
  policy_arn = aws_iam_policy.bedrock_invoke_policy.arn
}

#You will create a bedrock key yourself and attach it to the databricks env