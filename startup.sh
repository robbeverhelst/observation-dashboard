#!/bin/bash

# Inject runtime environment variables into Next.js
if [ ! -z "$MAPBOX_ACCESS_TOKEN" ]; then
    export NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="$MAPBOX_ACCESS_TOKEN"
fi

# Start the Next.js application
exec bun server.js