#!/bin/bash
mkdir /var/www/loveboat
cp views/* /var/www/loveboat
chown -R $USER:www-data /var/www/loveboat