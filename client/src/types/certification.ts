export interface Certification {
    id: number;
    name: string;
    issuer: string;
    date: string;
    credentialId: string;
    url?: string;
    candidateId?: number;
}

export interface CertificationFormData {
    name: string;
    issuer: string;
    date: string;
    credentialId: string;
    url?: string;
} 