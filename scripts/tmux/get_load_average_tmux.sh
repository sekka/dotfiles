#!/bin/bash

echo "$(uptime | awk '{print $(NF-2)}')"
