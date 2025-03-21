terraform {
  required_version = ">= 1.7.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.91.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  
  default_tags {
    tags = {
      Environment = "dev"
      Terraform   = "true"
      Project     = "security-ai"
    }
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-*-20.04-amd64-server-*"]
  }
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_instance" "security_ai" {
  ami           = "ami-08b5b3a93ed654d19"
  instance_type = "t2.micro"
  key_name      = "cloudsecure"
  
  vpc_security_group_ids = [aws_security_group.security_ai.id]
  
  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io
              systemctl start docker
              systemctl enable docker
              docker run -d -p 5000:5000 ai-threat-detection
              EOF

  tags = {
    Name = "Security-AI-Instance"
  }

  root_block_device {
    encrypted = true
  }
}

resource "aws_security_group" "security_ai" {
  name        = "security-ai-sg-${random_id.suffix.hex}"
  description = "Security group for AI threat detection instance"

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "security-ai-sg"
  }
}

output "instance_ip" {
  value = aws_instance.security_ai.public_ip
}