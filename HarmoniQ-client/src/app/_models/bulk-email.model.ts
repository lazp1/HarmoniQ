export interface BulkEmailRequest {
    departmentIds?: number[];
    specificEmployeeIds?: number[];
    subject: string;
    body: string;
    isHtml: boolean;
}
