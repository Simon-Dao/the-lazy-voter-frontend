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

variable "pghost" {
  description = "PostgreSQL host"
  type        = string
}

variable "pgdatabase" {
  description = "PostgreSQL database name"
  type        = string
  default     = "databricks_postgres"
}

variable "pguser" {
  description = "PostgreSQL username"
  type        = string
}

variable "pgpassword" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "pgsslmode" {
  description = "PostgreSQL SSL mode"
  type        = string
  default     = "require"
}
