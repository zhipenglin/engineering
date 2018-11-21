env=$1
if [ $env == 'test' ];then
    echo '10.9.10.2 neitui-candidate.testing2.cheng95.com' >> /etc/hosts
elif [ $env == 'prod' ];then
    echo '192.168.8.2 neitui-candidate.cheng95.com' >> /etc/hosts
fi

export EGG_SERVER_ENV=$env

npm run docker-start
