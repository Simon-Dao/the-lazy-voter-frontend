resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${var.bucket_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  aliases             = [var.domain_name, "www.${var.domain_name}"]

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-site-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  # API Gateway origin - CloudFront strips the matching path_pattern prefix
  # is NOT automatic, so API Gateway's default stage path shows up as-is.
  # Using $default stage means requests hit it at the domain root, e.g.
  # https://<api-id>.execute-api.<region>.amazonaws.com/bills
  origin {
    domain_name = replace(replace(aws_apigatewayv2_api.api.api_endpoint, "https://", ""), "/", "")
    origin_id   = "api-gateway-origin"

    custom_origin_config {
      http_port              = 80
      https_port              = 443
      origin_protocol_policy  = "https-only"
      origin_ssl_protocols    = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods          = ["GET", "HEAD"]
    target_origin_id        = "s3-site-origin"
    viewer_protocol_policy   = "redirect-to-https"
    compress                 = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  # Requests to /api/* get routed to API Gateway instead of S3.
  # Your Lambda routes (e.g. GET /bills) need to be called as /api/bills
  # from the frontend for this to match.
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    allowed_methods         = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    target_origin_id         = "api-gateway-origin"
    viewer_protocol_policy   = "https-only"
    compress                 = true

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type"]
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  # Next.js static export produces no trailing-slash routes by default in some
  # configs - a 404 handler pointing back to index.html keeps client-side
  # routing working for any dynamic paths
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/404.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}