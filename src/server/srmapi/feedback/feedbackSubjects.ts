import * as cheerio from 'cheerio';
import { createClient } from '@/server/utils/functions';
import { FetchSubjectsResult, Subject } from '@/types/server/feedback';

const FEEDBACK_PAGE_URL = 'https://student.srmap.edu.in/srmapstudentcorner/students/transaction/subjectwisefeedback.jsp';

export async function fetchFeedbackSubjects(sessionId: string): Promise<FetchSubjectsResult> {
    const session = createClient(sessionId);
    const subjectResponse = await session.post(FEEDBACK_PAGE_URL, 'ids=9');
    const $ = cheerio.load(subjectResponse.data);

    const subjects: Subject[] = [];

    $('td.clsSubject').each((_, elem) => {
        const id = $(elem).attr('id');
        if (!id) return;

        const tdClone = $(elem).clone();
        const faculty = tdClone.find('font').text().trim();
        tdClone.find('font').remove();
        const name = tdClone.text().replace(/\s+/g, ' ').trim();

        subjects.push({ id, name: name || id, faculty });
    });

    const feedbackType = $('#feedbacktype').val() ?? '';
    const mcontrollerValue = ($('#mcontroller').val() as string) || '';

    return {
        subjectIds: subjects.map(s => s.id),
        subjects,
        feedbackType,
        mcontrollerValue,
    };
}