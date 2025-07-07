#!/bin/bash

uptime | awk '{print $(NF-2)}'
