cd /home/cverond/www/ContentManager/API
tar czvf api.tgz 1.1
sudo scp api.tgz neo:/tmp
sudo scp api.tgz web1:/tmp

sudo ssh web1
cd /home/ContentManager.v6.5/API/
rm -rf 1.1/
tar xzvf /tmp/api.tgz
chown -R flexowner:flexowner 1.1/


cd /home/cverond/www/ContentManager.v6.5/API
rm -rf 1.1/
tar xzvf /tmp/api.tgz



