export interface CreatePatrolRequest {
    name: string;
    color: string;
    icon: string;
}
export interface AddMemberRequest {
    studentId: string;
}
export interface AddPointsRequest {
    points: number;
    reason: string;
}
export declare class PatrolService {
    static createPatrol(data: CreatePatrolRequest): Promise<{
        members: {
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            name: string;
            avatar: string | null;
            patrolId: string | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        color: string;
        icon: string;
        points: number;
    }>;
    static listPatrols(): Promise<({
        members: {
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            name: string;
            avatar: string | null;
            patrolId: string | null;
        }[];
        pointEntries: {
            id: string;
            patrolId: string;
            createdAt: Date;
            updatedAt: Date;
            points: number;
            reason: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        color: string;
        icon: string;
        points: number;
    })[]>;
    static getPatrolById(patrolId: string): Promise<{
        members: {
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            name: string;
            avatar: string | null;
            patrolId: string | null;
        }[];
        pointEntries: {
            id: string;
            patrolId: string;
            createdAt: Date;
            updatedAt: Date;
            points: number;
            reason: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        color: string;
        icon: string;
        points: number;
    }>;
    static addMemberToPatrol(patrolId: string, studentId: string): Promise<{
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        name: string;
        avatar: string | null;
        patrolId: string | null;
    }>;
    static removeMemberFromPatrol(patrolId: string, studentId: string): Promise<{
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        name: string;
        avatar: string | null;
        patrolId: string | null;
    }>;
    static addPointsToPatrol(patrolId: string, data: AddPointsRequest): Promise<{
        members: {
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            name: string;
            avatar: string | null;
            patrolId: string | null;
        }[];
        pointEntries: {
            id: string;
            patrolId: string;
            createdAt: Date;
            updatedAt: Date;
            points: number;
            reason: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        color: string;
        icon: string;
        points: number;
    }>;
    static deletePatrol(patrolId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static getAvailableStudents(): Promise<{
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        name: string;
        avatar: string | null;
        patrolId: string | null;
    }[]>;
    static listAllStudents(): Promise<{
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        name: string;
        avatar: string | null;
        patrolId: string | null;
    }[]>;
    static getPatrolMembers(patrolId: string): Promise<{
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        name: string;
        avatar: string | null;
        patrolId: string | null;
    }[]>;
}
//# sourceMappingURL=patrol.d.ts.map