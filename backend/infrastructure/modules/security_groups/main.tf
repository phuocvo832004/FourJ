// Security Group cho Public EC2 Instances
resource "aws_security_group" "public_ec2" {
  name        = "${var.project}-${var.environment}-public-ec2-sg"
  description = "Security group for public EC2 instances (allows SSH from specific IP)"
  vpc_id      = var.vpc_id

  // Ingress rule - chỉ cho phép SSH từ IP chỉ định
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
    description = "SSH access from specific IP"
  }

  // Egress rule - cho phép tất cả kết nối đi ra
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${var.project}-${var.environment}-public-ec2-sg"
    Environment = var.environment
    Project     = var.project
  }
}

// Security Group cho Private EC2 Instances
resource "aws_security_group" "private_ec2" {
  name        = "${var.project}-${var.environment}-private-ec2-sg"
  description = "Security group for private EC2 instances (allows SSH from public instances only)"
  vpc_id      = var.vpc_id

  // Ingress rule - chỉ cho phép SSH từ Public EC2 Security Group
  ingress {
    from_port         = 22
    to_port           = 22
    protocol          = "tcp"
    security_groups   = [aws_security_group.public_ec2.id]
    description       = "SSH access from public instances"
  }

  // Egress rule - cho phép tất cả kết nối đi ra
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${var.project}-${var.environment}-private-ec2-sg"
    Environment = var.environment
    Project     = var.project
  }
} 