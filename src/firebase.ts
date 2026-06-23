import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDyZ6wQcuYCuf4uT0v2BD9ewkJrkRx-_Cs",
  authDomain: "gen-lang-client-0416861088.firebaseapp.com",
  projectId: "gen-lang-client-0416861088",
  storageBucket: "gen-lang-client-0416861088.firebasestorage.app",
  messagingSenderId: "595382878029",
  appId: "1:595382878029:web:ca481cbad5b843b865c104"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-fb1a6c3a-fb82-40a5-8715-ad56710a88d9");
export const auth = getAuth(app);

isSupported().then(supported => {
  if (supported) {
    getAnalytics(app);
  }
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function sanitizeFirestoreData<T>(data: T): T {
  if (data === undefined) return "" as any;
  if (data === null) return null as any;
  if (Array.isArray(data)) {
    return data.map(sanitizeFirestoreData) as any;
  }
  if (typeof data === 'object') {
    const cleanObj: any = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        cleanObj[key] = sanitizeFirestoreData(val);
      }
    }
    return cleanObj;
  }
  return data;
}

