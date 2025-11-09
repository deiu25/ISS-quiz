import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Segment,
  Item,
  Dropdown,
  Divider,
  Button,
  Message,
} from 'semantic-ui-react';

import mindImg from '../../images/mind.svg';
import { COUNTDOWN_TIME } from '../../constants';
import { shuffle } from '../../utils';

// Load local quizzes
import mockQuizzes from '../Quiz/mock.json';

/** Helpers */
const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

/** Normalize various mock.json shapes:
 *  1) [ {question: ...}, ... ]         -> split into 5 sets of 20
 *  2) [ [q1..q20], [q1..q20], ... ]    -> take first 5
 *  3) { quizzes: [ [..], [..], ... ] } -> take first 5
 */
function computeQuizSets(raw) {
  if (!raw) return [];

  // case 3: { quizzes: [...] }
  if (raw && Array.isArray(raw.quizzes)) {
    return raw.quizzes.slice(0, 5).map((qs, i) => ({
      id: i + 1,
      title: `Quiz ${i + 1}`,
      questions: Array.isArray(qs) ? qs.slice(0, 20) : [],
    }));
  }

  // case 2: [ [..], [..], ... ]
  if (Array.isArray(raw) && raw.length && Array.isArray(raw[0])) {
    return raw.slice(0, 5).map((qs, i) => ({
      id: i + 1,
      title: `Quiz ${i + 1}`,
      questions: qs.slice(0, 20),
    }));
  }

  // case 1: [ {question:...}, ... ]
  if (Array.isArray(raw) && raw.length && raw[0] && raw[0].question) {
    const sets = chunk(raw, 20).slice(0, 5);
    return sets.map((qs, i) => ({
      id: i + 1,
      title: `Quiz ${i + 1}`,
      questions: qs,
    }));
  }

  return [];
}

const Main = ({ startQuiz }) => {
  // Build quiz sets once
  const QUIZ_SETS = useMemo(() => computeQuizSets(mockQuizzes), []);

  const QUIZ_OPTIONS = useMemo(
    () =>
      QUIZ_SETS.map(q => ({
        key: q.id,
        value: q.id,
        text: q.title,
      })),
    [QUIZ_SETS]
  );

  // Compute a safe default "30 minutes" value from COUNTDOWN_TIME.minutes,
  // regardless if values are in minutes or seconds.
  const DEFAULT_MINUTES_VALUE = useMemo(() => {
    const opts = COUNTDOWN_TIME?.minutes || [];
    // try by label text "30"
    const byText = opts.find(o => String(o.text).includes('30'))?.value;
    if (byText !== undefined) return byText;
    // try common encodings
    const bySec = opts.find(o => Number(o.value) === 30 * 60)?.value;
    if (bySec !== undefined) return bySec;
    const byMin = opts.find(o => Number(o.value) === 30)?.value;
    if (byMin !== undefined) return byMin;
    // fallback
    return opts[0]?.value ?? 30 * 60;
  }, []);

  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [countdownTime, setCountdownTime] = useState({
    hours: 0,
    minutes: DEFAULT_MINUTES_VALUE, // default 30 minutes
    seconds: 0,
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleTimeChange = (e, { name, value }) => {
    setCountdownTime(prev => ({ ...prev, [name]: value }));
  };

  const totalTime =
    (countdownTime.hours || 0) +
    (countdownTime.minutes || 0) +
    (countdownTime.seconds || 0);

  const allFieldsSelected = selectedQuizId && totalTime > 0;

  const startLocalQuiz = () => {
    if (error) setError(null);
    setProcessing(true);

    const selected = QUIZ_SETS.find(q => q.id === selectedQuizId);
    if (!selected || !Array.isArray(selected.questions) || selected.questions.length === 0) {
      setProcessing(false);
      setError({ message: 'Nu am găsit întrebări pentru acest quiz.' });
      return;
    }

    const prepared = selected.questions.map(q => {
      const hasOptions = Array.isArray(q.options) && q.options.length > 0;
      const options = hasOptions
        ? shuffle(q.options.slice())
        : shuffle([q.correct_answer, ...(q.incorrect_answers || [])]);
      return { ...q, options };
    });

    setTimeout(() => {
      setProcessing(false);
      startQuiz(prepared, totalTime);
    }, 500);
  };

  return (
    <Container>
      <Segment>
        <Item.Group divided>
          <Item>
            <Item.Image src={mindImg} />
            <Item.Content>
              <Item.Header>
                <h1>ISS Quiz</h1>
              </Item.Header>

              {error && (
                <Message error onDismiss={() => setError(null)}>
                  <Message.Header>Eroare!</Message.Header>
                  {error.message}
                </Message>
              )}

              <Divider />

              <Item.Meta>
                <p>Alege quiz-ul pe care vrei să-l joci:</p>
                <Dropdown
                  fluid
                  selection
                  name="quiz"
                  placeholder="Select Quiz"
                  header="Select Quiz"
                  options={QUIZ_OPTIONS}
                  value={selectedQuizId}
                  onChange={(e, { value }) => setSelectedQuizId(value)}
                  disabled={processing}
                />

                <br />
                <p>Selectează timpul (countdown):</p>
                <Dropdown
                  search
                  selection
                  name="minutes"
                  placeholder="Select Minutes"
                  header="Select Minutes"
                  options={COUNTDOWN_TIME.minutes}
                  value={countdownTime.minutes}
                  onChange={handleTimeChange}
                  disabled={processing}
                />
              </Item.Meta>

              <Divider />

              <Item.Extra>
                <Button
                  primary
                  size="big"
                  icon="play"
                  labelPosition="left"
                  content={processing ? 'Processing...' : 'Play Now'}
                  onClick={startLocalQuiz}
                  disabled={!allFieldsSelected || processing}
                />
              </Item.Extra>
            </Item.Content>
          </Item>
        </Item.Group>
      </Segment>
      <br />
    </Container>
  );
};

Main.propTypes = {
  startQuiz: PropTypes.func.isRequired,
};

export default Main;
