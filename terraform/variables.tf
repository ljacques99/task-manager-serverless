variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Project name used as prefix for all resources"
  type        = string
  default     = "task-manager"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}
