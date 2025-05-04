resource "aws_vpc" "main" {
  count                = var.create_vpc ? 1 : 0
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project}-${var.environment}-vpc"
    Environment = var.environment
    Project     = var.project
  }
}

locals {
  vpc_id = var.create_vpc ? aws_vpc.main[0].id : var.vpc_id
}

resource "aws_subnet" "public" {
  count             = var.create_vpc ? length(var.public_subnet_cidrs) : 0
  vpc_id            = local.vpc_id
  cidr_block        = var.public_subnet_cidrs[count.index]
  availability_zone = "ap-southeast-1a"

  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.project}-${var.environment}-public-subnet-${count.index + 1}"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_subnet" "private" {
  count             = var.create_vpc ? length(var.private_subnet_cidrs) : 0
  vpc_id            = local.vpc_id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = "ap-southeast-1a"

  tags = {
    Name        = "${var.project}-${var.environment}-private-subnet-${count.index + 1}"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_internet_gateway" "main" {
  count  = var.create_vpc ? 1 : 0
  vpc_id = local.vpc_id

  tags = {
    Name        = "${var.project}-${var.environment}-igw"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_eip" "nat" {
  count  = var.create_vpc ? 1 : 0
  domain = "vpc"

  tags = {
    Name        = "${var.project}-${var.environment}-nat-eip"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_nat_gateway" "main" {
  count         = var.create_vpc ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name        = "${var.project}-${var.environment}-nat"
    Environment = var.environment
    Project     = var.project
  }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_route_table" "public" {
  count  = var.create_vpc ? 1 : 0
  vpc_id = local.vpc_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main[0].id
  }

  tags = {
    Name        = "${var.project}-${var.environment}-public-rt"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_route_table" "private" {
  count  = var.create_vpc ? 1 : 0
  vpc_id = local.vpc_id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[0].id
  }

  tags = {
    Name        = "${var.project}-${var.environment}-private-rt"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_route_table_association" "public" {
  count          = var.create_vpc ? length(var.public_subnet_cidrs) : 0
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public[0].id
}

resource "aws_route_table_association" "private" {
  count          = var.create_vpc ? length(var.private_subnet_cidrs) : 0
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[0].id
} 
