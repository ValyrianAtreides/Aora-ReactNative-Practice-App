import { Account, Client, ID, Avatars, Databases, Query, Storage } from 'react-native-appwrite';
import 'react-native-url-polyfill/auto';

export const appwriteConfig = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.berkay.aora',
  projectId: '66b3c8c80032392f3da7',
  databaseId: '66b3cad8003b4c21f2bb',
  userCollectionId: '66b3cb03000b1156d163',
  videoCollectionId: '66b3cb200027a7b9591c',
  storageId: '66b3cce500357ace1ee8'
};

// Init your React Native SDK
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client)

export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );
    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}

export async function signIn(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getAccount() {
  try {

    const account = new Account(client);
    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}


export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    {/*const currentUser = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("userId", currentAccount.$id)]
    );*/}
    
    
    return currentAccount;
  } catch (error) {
    console.log(error);
    return null;
  }
}


export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId
    )
    // const storagePosts = await storage.listFiles(
    //   appwriteConfig.storageId,
    // )
    // const allPosts = [...posts.documents, ...storagePosts.files]
    // return allPosts;
    return posts;
  } catch (error) {
    throw new Error(error)
    
  }
}

export const getLatestsPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.orderDesc('$createdAt', Query.limit(7))]
    )
    return posts.documents;
  } catch (error) {
    throw new Error(error)
    
  }
}

export const searchsPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.search('title', query)]
    )
    return posts.documents;
  } catch (error) {
    throw new Error(error)
    
  }
}

export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.equal('creator', userId)]  
    )
    return posts.documents;
  } catch (error) {
    throw new Error(error)
    
  }
}

export const signOut = async () => {
  try {
    const currentAccount = await account.get()
    const currentAccountId= currentAccount.$id
    const session =  await account.deleteSession(currentAccountId);
    return session;
  } catch (error) {
    console.log(error)
    
  }
}

export const getFilePreview = async (fileId, type) => {
  let fileUrl;
  try {
    if (type === "video") {
      fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        appwriteConfig.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
    
  }
}

export const uploadFile = async (file, type) => {
  if(!file) return;

  const {mimeType, ...rest} = file;
  const asset = {type: mimeType, ...rest} //set vidoes mimetype attribute to "type" for appwrite to understand 

  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
  } catch (error) {
    throw new Error(error);
  }
}

export const createVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl ] = await Promise.all([
      uploadFile(form.thumbnail, 'image'),
      uploadFile(form.video, 'video')
    ]) //start uploading everything in the same time
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt:form.prompt,
        creator: form.userId
      }
    )
    console.log("new post:", newPost)
    return newPost;
  } catch (error) {
    console.log("erorr while submitting the video", error)
    
  }
}