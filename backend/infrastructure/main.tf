terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}

module "security_groups" {
  source = "./modules/security_groups"

  vpc_id         = var.existing_vpc_id
  project        = var.project
  environment    = var.environment
  allowed_ssh_ip = var.allowed_ssh_ip
}
