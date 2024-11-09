import { deleteObject, listAll, ref } from "firebase/storage";
import { storage } from "../firbaseConfig";


export const deleteStudentImage = async (roomId, currentUserPid) => {
    const folderRef = ref(storage, `InCallstudentsImage/${currentUserPid}/`); // Reference to the folder
    console.log('Deleting images...', roomId, currentUserPid);


    try {
        // // List all items in the folder
        // const result = await listAll(folderRef);

        // if (result.items.length === 0) {
        //     console.log('No images to delete.'); // Log if no images are found
        //     return;
        // }
        // const deletePromises = result.items.map(item => deleteObject(item));

        // // Wait for all delete promises to resolve
        // await Promise.all(deletePromises);
        // console.log('All images deleted successfully.'); // Log success message

        // List all items in the folder asynchronously (non-blocking)
        listAll(folderRef)
            .then((result) => {
                if (result.items.length === 0) {
                    console.log('No images to delete.'); // Log if no images are found
                    return;
                }

                // Map each item to a delete request
                const deletePromises = result.items.map((item) => deleteObject(item));

                // Execute delete in the background without awaiting
                Promise.all(deletePromises)
                    .then(() => {
                        console.log(`All images deleted successfully form roomID:${roomId} of StudentPID:${currentUserPid}.`); // Log success message
                    })
                    .catch((error) => {
                        console.error('Error deleting images:', error); // Log any deletion error
                    });
            })
            .catch((error) => {
                console.error('Error listing images:', error); // Log any error that occurs while listing items
            });

    } catch (error) {
        console.error('Error deleting images:', error); // Log any error that occurs
    }
} 