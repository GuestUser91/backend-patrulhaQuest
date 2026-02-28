import prisma from '../prisma';

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

export class PatrolService {
  // Criar nova patrulha
  static async createPatrol(data: CreatePatrolRequest) {
    // Verificar se patrulha com esse nome já existe
    const existingPatrol = await prisma.patrol.findUnique({
      where: { name: data.name },
    });

    if (existingPatrol) {
      throw new Error('Patrulha com esse nome já existe');
    }

    const patrol = await prisma.patrol.create({
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon,
        points: 0,
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            patrolId: true,
          },
        },
      },
    });

    return patrol;
  }

  // Listar todas as patrulhas
  static async listPatrols() {
    const patrols = await prisma.patrol.findMany({
      include: {
        members: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            patrolId: true,
          },
        },
        pointEntries: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return patrols;
  }

  // Obter detalhes de uma patrulha
  static async getPatrolById(patrolId: string) {
    const patrol = await prisma.patrol.findUnique({
      where: { id: patrolId },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            patrolId: true,
          },
        },
        pointEntries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patrol) {
      throw new Error('Patrulha não encontrada');
    }

    return patrol;
  }

  // Adicionar aluno à patrulha
  static async addMemberToPatrol(patrolId: string, studentId: string) {
    // Verificar se patrulha existe
    const patrol = await prisma.patrol.findUnique({
      where: { id: patrolId },
    });

    if (!patrol) {
      throw new Error('Patrulha não encontrada');
    }

    // Verificar se aluno existe e é estudante
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error('Aluno não encontrado');
    }

    if (student.role !== 'STUDENT') {
      throw new Error('Apenas alunos podem ser adicionados à patrulha');
    }

    // Se o aluno já está em outra patrulha, impedir a adição
    if (student.patrolId && student.patrolId !== patrolId) {
      throw new Error('Aluno já pertence a outra patrulha');
    }

    // Adicionar aluno à patrulha
    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: { patrolId },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        patrolId: true,
      },
    });

    return updatedStudent;
  }

  // Remover aluno da patrulha
  static async removeMemberFromPatrol(patrolId: string, studentId: string) {
    // Verificar se patrulha existe
    const patrol = await prisma.patrol.findUnique({
      where: { id: patrolId },
    });

    if (!patrol) {
      throw new Error('Patrulha não encontrada');
    }

    // Remover aluno da patrulha
    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: { patrolId: null },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        patrolId: true,
      },
    });

    return updatedStudent;
  }

  // Adicionar pontos à patrulha
  static async addPointsToPatrol(patrolId: string, data: AddPointsRequest) {
    // Verificar se patrulha existe
    const patrol = await prisma.patrol.findUnique({
      where: { id: patrolId },
    });

    if (!patrol) {
      throw new Error('Patrulha não encontrada');
    }

    // Criar entrada de pontos
    const pointEntry = await prisma.pointEntry.create({
      data: {
        patrolId,
        points: data.points,
        reason: data.reason,
      },
    });

    // Atualizar pontos da patrulha
    const updatedPatrol = await prisma.patrol.update({
      where: { id: patrolId },
      data: {
        points: {
          increment: data.points,
        },
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            patrolId: true,
          },
        },
        pointEntries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return updatedPatrol;
  }

  // Deletar patrulha
  static async deletePatrol(patrolId: string) {
    // Verificar se patrulha existe
    const patrol = await prisma.patrol.findUnique({
      where: { id: patrolId },
    });

    if (!patrol) {
      throw new Error('Patrulha não encontrada');
    }

    // Remover alunos da patrulha
    await prisma.user.updateMany({
      where: { patrolId },
      data: { patrolId: null },
    });

    // Deletar patrulha
    await prisma.patrol.delete({
      where: { id: patrolId },
    });

    return { success: true, message: 'Patrulha deletada com sucesso' };
  }

  // Listar todos os alunos disponíveis (sem patrulha)
  static async getAvailableStudents() {
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        patrolId: null,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        patrolId: true,
      },
      orderBy: { name: 'asc' },
    });

    return students;
  }

  // Listar todos os alunos (independentemente da patrulha)
  static async listAllStudents() {
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        patrolId: true,
      },
      orderBy: { name: 'asc' },
    });

    return students;
  }

  // Obter alunos de uma patrulha
  static async getPatrolMembers(patrolId: string) {
    const patrol = await prisma.patrol.findUnique({
      where: { id: patrolId },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            patrolId: true,
          },
        },
      },
    });

    if (!patrol) {
      throw new Error('Patrulha não encontrada');
    }

    return patrol.members;
  }
}
