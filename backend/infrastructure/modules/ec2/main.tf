// EC2 instances trong public subnets
resource "aws_instance" "public" {
  count                       = length(var.public_subnet_ids)
  ami                         = var.ami_id
  instance_type               = var.instance_type
  subnet_id                   = var.public_subnet_ids[count.index]
  vpc_security_group_ids      = [var.public_ec2_sg_id]
  key_name                    = var.key_name
  associate_public_ip_address = true

  root_block_device {
    volume_size = var.root_volume_size
    volume_type = "gp3"
  }

  tags = {
    Name        = "${var.project}-${var.environment}-public-ec2-${count.index + 1}"
    Environment = var.environment
    Project     = var.project
  }
}

// EC2 instances trong private subnets
resource "aws_instance" "private" {
  count                  = length(var.private_subnet_ids)
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = var.private_subnet_ids[count.index]
  vpc_security_group_ids = [var.private_ec2_sg_id]
  key_name               = var.key_name

  root_block_device {
    volume_size = var.root_volume_size
    volume_type = "gp3"
  }

  tags = {
    Name        = "${var.project}-${var.environment}-private-ec2-${count.index + 1}"
    Environment = var.environment
    Project     = var.project
  }
} 
