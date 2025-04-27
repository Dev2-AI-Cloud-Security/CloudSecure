
provider "aws" {
  region = "us-east-2"
}

# EC2 Instance
resource "aws_instance" "my-ec2-instance" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  tags = {
    Name = "my-ec2-instance"
  }
}
