###
# This file load and launch the docker image
###

# Extract the archive
echo "Extracting archive ..."
tar -xzf ./wanikani-stats_docker.tar.gz

# Stop the previous container
echo "Stopping and removing previous container/image ..."
sudo docker stop wanikani-stats
sudo docker rm wanikani-stats
sudo docker rmi wanikani-stats/server:latest

# Launch the docker image
echo "Loading and starting new image/container ..."
sudo docker load < wanikani-stats_docker.tar
sudo docker run -td --name wanikani-stats -p 3170:3170 wanikani-stats/server

echo "Restarting apache2 ..."
sudo service apache2 restart

echo "Done !"
