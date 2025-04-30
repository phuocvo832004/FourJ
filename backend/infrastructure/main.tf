terraform {
  backend "s3" {
    bucket         = "fourj-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }

  required_version = ">= 1.0.0"
} 