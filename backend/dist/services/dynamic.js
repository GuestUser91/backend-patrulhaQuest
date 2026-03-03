import prisma from '../prisma';
export class DynamicService {
    static async createDynamic(data) {
        const createData = {
            title: data.title,
            description: data.description || '',
            type: data.type,
            active: data.active ?? true,
        };
        if (data.startAt !== undefined) {
            createData.startAt = data.startAt ? new Date(data.startAt) : null;
        }
        if (data.endAt !== undefined) {
            createData.endAt = data.endAt ? new Date(data.endAt) : null;
        }
        if (data.questions && data.questions.length > 0) {
            createData.questions = {
                create: data.questions.map(q => ({
                    id: q.id,
                    question: q.question,
                    type: q.type,
                    options: q.options,
                    correctIndex: q.correctIndex,
                    points: q.points ?? 10,
                })),
            };
        }
        if (data.words && data.words.length > 0) {
            createData.words = {
                create: data.words.map(w => ({
                    id: w.id,
                    word: w.word,
                    hint: w.hint || '',
                    points: w.points ?? 10,
                })),
            };
        }
        if (data.memoryCards && data.memoryCards.length > 0) {
            createData.memoryCards = {
                create: data.memoryCards.map(m => ({
                    id: m.id,
                    content: m.content,
                    pairId: m.pairId,
                })),
            };
        }
        const dynamic = await prisma.dynamic.create({
            data: createData,
            include: {
                questions: true,
                words: true,
                memoryCards: true,
            },
        });
        return dynamic;
    }
    static async listDynamics() {
        const dynamics = await prisma.dynamic.findMany({
            include: {
                questions: true,
                words: true,
                memoryCards: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return dynamics;
    }
    static async getDynamicById(id) {
        const dyn = await prisma.dynamic.findUnique({
            where: { id },
            include: { questions: true, words: true, memoryCards: true },
        });
        if (!dyn)
            throw new Error('Dinâmica não encontrada');
        return dyn;
    }
    static async deleteDynamic(id) {
        const dyn = await prisma.dynamic.findUnique({ where: { id } });
        if (!dyn)
            throw new Error('Dinâmica não encontrada');
        await prisma.dynamic.delete({ where: { id } });
        return { success: true, message: 'Dinâmica removida' };
    }
}
export default DynamicService;
//# sourceMappingURL=dynamic.js.map