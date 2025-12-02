variable "project" {}

variable "region" {
  description = "Region where resources will be deployed"
  type        = string
  default     = "us-central1"
}

variable "public_subnet_cidr" {
  description = "CIDR range for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "CIDR range for the private subnet"
  type        = string
  default     = "10.0.2.0/24"
}

variable "vm_zone" {
  description = "Zone for the VM"
  type        = string
  default     = "us-central1-a"
}
