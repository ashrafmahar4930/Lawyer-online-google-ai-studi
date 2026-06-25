
import { auth } from '../services/firebase';
import { logService } from '../services/logService';

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
  stackTrace?: string;
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, shouldThrow: boolean = true) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    stackTrace: error instanceof Error ? error.stack : new Error().stack,
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
  }
  
  const errorMsg = error instanceof Error ? error.message : String(error);
  const isOffline = errorMsg.toLowerCase().includes('offline') || errorMsg.toLowerCase().includes('failed to get document') || errorMsg.toLowerCase().includes('unreachable');

  if (isOffline) {
    console.warn(`[Firestore Offline Warning] Operation: ${operationType} on path: ${path}. Details:`, errorMsg);
    if (shouldThrow) {
      const errorJson = JSON.stringify(errInfo);
      throw new Error(errorJson);
    }
    return;
  }
  
  logService.error(`Firestore ${operationType} Error on path: ${path}`, errInfo, 'Firestore');
  
  // Skill requirement: Throw JSON string for the agent to parse
  const errorJson = JSON.stringify(errInfo);
  if (shouldThrow) {
    console.error('Firestore Error:', errorJson);
    throw new Error(errorJson);
  } else {
    console.warn('Firestore Warning (Caught):', errorJson);
  }
}
