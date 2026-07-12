terraform {

  backend "s3" {
    bucket       = "the-lazy-voter-tfstate"
    key          = "terraform.tfstate"
    region       = "us-west-2"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# CloudFront requires ACM certs to live in us-east-1, regardless of where
# everything else is deployed
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}