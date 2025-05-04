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

// Networking Module
module "networking" {
  source = "./modules/networking"

  aws_region           = var.aws_region
  project              = var.project
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

// Security Groups Module
module "security_groups" {
  source = "./modules/security_groups"

  vpc_id          = module.networking.vpc_id
  project         = var.project
  environment     = var.environment
  allowed_ssh_cidr = var.allowed_ssh_cidr
}

// EC2 Module
module "ec2" {
  source = "./modules/ec2"

  project           = var.project
  environment       = var.environment
  public_subnet_ids = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids
  public_ec2_sg_id  = module.security_groups.public_ec2_sg_id
  private_ec2_sg_id = module.security_groups.private_ec2_sg_id
  key_name          = var.key_name
  instance_type     = var.instance_type
} 