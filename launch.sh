###
# This file load and launch the docker image
###

# Extract the archive
tar -xzf ./wanikani-stats_docker.tar.gz

# Stop the previous container
sudo docker stop wanikani-stats 
sudo docker rm wanikani-stats
sudo docker rmi wanikani-stats/server:latest

# Launch the docker image
sudo docker load < wanikani-stats_docker.tar
sudo docker run -td --name wanikani-stats -p 3170:3170 wanikani-stats/server
sudo service apache2 restart

