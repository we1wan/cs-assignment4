variable "key_name" {
  type        = string
  description = "SSH key pair"
  default     = "viga-key"
}

variable "public_key" {
  type        = string
  description = "public SSH key string"
}

variable "ip" {
  type        = string
  description = "current IP address for restricted SSH access"
}

variable "image_name" {
  type        = string
  default     = "Ubuntu-22.04"
}

variable "flavor_name" {
  type        = string
  default     = "standard.tiny"
}