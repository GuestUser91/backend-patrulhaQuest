export interface CreateDynamicRequest {
    title: string;
    description?: string;
    type: string;
    active?: boolean;
    startAt?: string | null;
    endAt?: string | null;
    questions?: any[];
    words?: any[];
    memoryCards?: any[];
}
export declare class DynamicService {
    static createDynamic(data: CreateDynamicRequest): Promise<{
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            points: number;
            options: string[];
            type: string;
            question: string;
            correctIndex: number;
            dynamicId: string;
        }[];
        words: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            points: number;
            dynamicId: string;
            word: string;
            hint: string;
        }[];
        memoryCards: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dynamicId: string;
            content: string;
            pairId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        title: string;
        description: string;
        active: boolean;
        startAt: Date | null;
        endAt: Date | null;
    }>;
    static listDynamics(): Promise<({
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            points: number;
            options: string[];
            type: string;
            question: string;
            correctIndex: number;
            dynamicId: string;
        }[];
        words: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            points: number;
            dynamicId: string;
            word: string;
            hint: string;
        }[];
        memoryCards: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dynamicId: string;
            content: string;
            pairId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        title: string;
        description: string;
        active: boolean;
        startAt: Date | null;
        endAt: Date | null;
    })[]>;
    static getDynamicById(id: string): Promise<{
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            points: number;
            options: string[];
            type: string;
            question: string;
            correctIndex: number;
            dynamicId: string;
        }[];
        words: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            points: number;
            dynamicId: string;
            word: string;
            hint: string;
        }[];
        memoryCards: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dynamicId: string;
            content: string;
            pairId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        title: string;
        description: string;
        active: boolean;
        startAt: Date | null;
        endAt: Date | null;
    }>;
    static deleteDynamic(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
export default DynamicService;
//# sourceMappingURL=dynamic.d.ts.map