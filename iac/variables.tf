variable "aws_region" {
  description = "AWS region"
  type = string
  default = "us-west-2"
}

variable "profile" {
  description = "AWS profile name"
  type = string
  default = "terraform"
}

variable "bucket_name" {
  description = "Name of the S3 bucket"
  type = string
  default = "the-lazy-voter-serving"
}

variable "domain_name" {
  description = "Root domain, e.g. thelazyvoter.org"
  type        = string
  default = "thelazyvoter.org"
}
