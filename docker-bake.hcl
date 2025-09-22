group "default" {
  targets = ["ingestor", "api", "web"]
}

target "ingestor" {
  context = "./services/ingestor"
  dockerfile = "Dockerfile"
  tags = ["moonplkr/beacon-explorer:ingestor-latest"]
  platforms = ["linux/amd64", "linux/arm64"]
  cache-from = ["type=gha"]
  cache-to = ["type=gha,mode=max"]
}

target "api" {
  context = "./services/api"
  dockerfile = "Dockerfile"
  tags = ["moonplkr/beacon-explorer:api-latest"]
  platforms = ["linux/amd64", "linux/arm64"]
  cache-from = ["type=gha"]
  cache-to = ["type=gha,mode=max"]
}

target "web" {
  context = "./services/web"
  dockerfile = "Dockerfile"
  tags = ["moonplkr/beacon-explorer:web-latest"]
  platforms = ["linux/amd64", "linux/arm64"]
  cache-from = ["type=gha"]
  cache-to = ["type=gha,mode=max"]
}