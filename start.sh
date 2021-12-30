while true
do

node tars.js

echo "Rebooting in:"
for i in 30 20 10
do
echo "$i..."
sleep 10
done

echo "Rebooting now!"
done
