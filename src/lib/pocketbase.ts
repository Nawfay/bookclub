import PocketBase from "pocketbase"

// Initialize PocketBase client
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://192.168.1.101:8090" )

// Enable auto cancellation of pending requests
pb.autoCancellation(false)

export default pb
