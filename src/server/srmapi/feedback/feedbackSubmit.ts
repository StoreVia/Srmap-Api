import * as cheerio from 'cheerio';
import { createClient } from '@/server/utils/functions';
import { isValidComment } from '@/validators/srmapi/feedback';
import { fetchFeedbackSubjects } from '@/server/srmapi/feedback/feedbackSubjects';
import { FeedbackResponse, Answer, DescriptiveAnswer } from '@/types/server/feedback';

export async function submitFeedback(sessionId: string, comment: string, optionNo: number = 5, selectedSubjectIds?: string[]): Promise<FeedbackResponse> {
    const FETCH_FEEDBACK_FORM_URL = 'https://student.srmap.edu.in/srmapstudentcorner/students/transaction/subjectwisefeedbackresources.jsp';
    const SUBMIT_FEEDBACK_URL = 'https://student.srmap.edu.in/srmapstudentcorner/students/transaction/subjectwisefeedbackresources.jsp';

    const [isValid, message] = isValidComment(comment);
    const answerOptions = [
        { value: '21', label: 'Strongly disagree', pointvalue: '1.00' },
        { value: '22', label: 'Somewhat disagree', pointvalue: '2.00' },
        { value: '23', label: 'Neutral', pointvalue: '3.00' },
        { value: '24', label: 'Somewhat agree', pointvalue: '4.00' },
        { value: '25', label: 'Strongly agree', pointvalue: '5.00' }
    ];

    if (optionNo < 1 || optionNo > answerOptions.length) {
        return { success: false, message: 'Answer option number should be between 1-5 only!' };
    }

    if (!isValid && message) {
        return { success: false, message };
    }

    const { subjectIds: allSubjectIds, feedbackType: type, mcontrollerValue } = await fetchFeedbackSubjects(sessionId);

    const subjectIds = selectedSubjectIds && selectedSubjectIds.length > 0
        ? allSubjectIds.filter(id => selectedSubjectIds.includes(id))
        : allSubjectIds;

    if (subjectIds.length === 0) {
        return { success: false, message: 'No subjects found, your feedback may have been already submitted!' };
    }

    const session = createClient(sessionId);

    const results = await Promise.all(
        subjectIds.map(async (subjectId) => {
            const formData = new URLSearchParams();
            formData.append('ids', '1');
            formData.append('filter', subjectId);
            formData.append('controller', mcontrollerValue);

            const formResponse = await session.post(FETCH_FEEDBACK_FORM_URL, formData);
            if (formResponse.status !== 200) return { success: false };

            const formSoup = cheerio.load(formResponse.data);
            const hdnControllerId = formSoup('#hdnControllerId').val() as string;
            const txtRemarks = formSoup('#txtRemarks').val() as string;

            const answersJson: Answer[] = [];
            const questions = formSoup('tr.clsquestions').slice(0, 20);

            questions.each((_, question) => {
                const questionElem = formSoup(question);
                const questionId = questionElem.attr('id')?.replace(/_\d+$/, '');
                if (!questionId) return;

                const answerInputs = questionElem.find('input.answers');
                const selectedOption = answerOptions[optionNo - 1];

                if (selectedOption && answerInputs.length > 0) {
                    const selectedAnswer = answerInputs
                        .filter((_, elem) => formSoup(elem).attr('answervalue') === selectedOption.value)
                        .first();

                    if (selectedAnswer.length > 0) {
                        answersJson.push({
                            questionid: questionId,
                            answerid: selectedAnswer.attr('id') || '',
                            answerdesc: selectedOption.label.replace(' ', '+'),
                            quesid: selectedAnswer.attr('quesid') || questionId,
                            partid: selectedAnswer.attr('partid') || '',
                            answervalue: selectedOption.value,
                            pointvalue: selectedOption.pointvalue
                        });
                    }
                }
            });

            const descriptiveJson: DescriptiveAnswer[] = [];
            const descriptiveQuestions = formSoup('tr.clsquestions')
                .filter((_, elem) => formSoup(elem).find('textarea').length > 0)
                .slice(0, 5);

            descriptiveQuestions.each((_, elem) => {
                const questionElem = formSoup(elem);
                const questionId = questionElem.attr('itemid')?.replace(/_\d+$/, '');
                const textarea = questionElem.find('textarea');
                const quesid = textarea.attr('quesid');

                if (questionId && quesid) {
                    descriptiveJson.push({
                        questionid: questionId,
                        answerdesc: comment.replace(' ', '+'),
                        quesid,
                        partid: textarea.attr('partid') || '6'
                    });
                }
            });

            const params = new URLSearchParams({
                txtRemarks: txtRemarks,
                hdnSubjectId: subjectId,
                hdnControllerId: hdnControllerId,
                ids: "2",
                filter: "",
                answers: JSON.stringify(answersJson),
                descriptiveanswer: JSON.stringify(descriptiveJson),
                remarks: txtRemarks,
                feedbacktype: String(type)
            });

            const submitResponse = await session.post(
                SUBMIT_FEEDBACK_URL,
                params.toString(),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
                }
            );

            try {
                const data = typeof submitResponse.data === 'string'
                    ? JSON.parse(submitResponse.data)
                    : submitResponse.data;

                return { success: data.result === 'Feedback Completed' };
            } catch {
                return { success: submitResponse.status === 200 };
            }
        })
    );

    const processedSubjects = results.length;
    const successFlag = results.some(r => r.success);

    return {
        success: successFlag,
        message: successFlag ? 'Feedback submitted successfully' : 'Feedback submission failed',
        processedSubjects
    };
}