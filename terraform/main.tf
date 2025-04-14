# Configure the AWS provider
provider "aws" {
  region = "us-east-1"
}

# Fetch the default VPC
data "aws_vpc" "default" {
  default = true
}

# Fetch the default subnet in the default VPC
data "aws_subnet" "default" {
  vpc_id            = data.aws_vpc.default.id
  availability_zone = "us-east-2a"
  default_for_az    = true
}

# Reference the existing security group
data "aws_security_group" "cloudsecure_sg" {
  name   = "cloudsecure-sg"
  vpc_id = data.aws_vpc.default.id
}

# Fetch the latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

# Create EC2 instance with a unique tag to force recreation
resource "aws_instance" "cloudsecure" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = "t2.micro"
  key_name      = "cloudsecure-key"

  subnet_id              = data.aws_subnet.default.id
  vpc_security_group_ids = [data.aws_security_group.cloudsecure_sg.id]

  # Set root volume to 10 GiB
  root_block_device {
    volume_size           = 10 # GiB
    volume_type           = "gp3"
    delete_on_termination = true
  }

  user_data = <<-EOF
              #!/bin/bash
              dnf update -y
              dnf install -y docker cloud-utils-growpart
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ec2-user
              # Resize partition and filesystem
              echo "Resizing partition..." > /home/ec2-user/resize.log 2>&1
              growpart /dev/xvda 1 >> /home/ec2-user/resize.log 2>&1 || echo "growpart failed" >> /home/ec2-user/resize.log
              echo "Resizing filesystem..." >> /home/ec2-user/resize.log 2>&1
              xfs_growfs / >> /home/ec2-user/resize.log 2>&1 || echo "xfs_growfs failed" >> /home/ec2-user/resize.log
              df -h / >> /home/ec2-user/resize.log 2>&1
              # Ensure the log is readable
              chmod 644 /home/ec2-user/resize.log
              EOF

  tags = {
    Name = "cloudsecure-instance-${timestamp()}"
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [data.aws_ami.amazon_linux_2023]
}

output "instance_ip" {
  description = "Public IP of the cloudsecure instance"
  value       = aws_instance.cloudsecure.public_ip
}