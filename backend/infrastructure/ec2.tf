data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_instance" "app" {
  count                  = length(var.public_subnet_cidrs)
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public[count.index].id
  vpc_security_group_ids = [aws_security_group.app.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name        = "${var.project}-${var.environment}-app-${count.index + 1}"
    Environment = var.environment
    Project     = var.project
  }
} 