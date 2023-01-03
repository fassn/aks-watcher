import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
})

export function uploadImage(imageUploaded: any,
        options: any = { use_filename: true, unique_filename: false, overwrite: true }) {

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            imageUploaded,
            options,
            (err, res) => {
                if (err) reject(err)
                resolve(res)
            }
        )
    })
}

export function destroyImage(public_id: any,
        options: any = { resource_type: 'image', invalidate: true }) {

    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(public_id, options,
            (err, res) => {
                if (err) reject(err)
                resolve(res)
            }
        )
    })
}

export function destroyImages(public_ids: string[],
        options: any = { resource_type: 'image', invalidate: true }) {

    return new Promise((resolve, reject) => {
        cloudinary.api.delete_resources(public_ids, options,
            (err, res) => {
                if (err) reject(err)
                resolve(res)
            }
        )
    })
}