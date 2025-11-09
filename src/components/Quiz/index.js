import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Segment,
  Item,
  Divider,
  Button,
  Icon,
  Message,
  Menu,
  Header,
} from 'semantic-ui-react';
import he from 'he';

import Countdown from '../Countdown';
import { getLetter } from '../../utils';

const Quiz = ({ data, countdownTime, endQuiz }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userSlectedAns, setUserSlectedAns] = useState(null);
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState([]);
  const [timeTaken, setTimeTaken] = useState(null);

  // NEW: toggle pentru afișarea răspunsului corect
  const [showCorrect, setShowCorrect] = useState(false);

  useEffect(() => {
    if (questionIndex > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [questionIndex]);

  // Resetăm afișarea răspunsului corect la fiecare întrebare
  useEffect(() => {
    setShowCorrect(false);
  }, [questionIndex]);

  const handleItemClick = (e, { name }) => {
    setUserSlectedAns(name);
  };

  const handleNext = () => {
    let point = 0;
    if (userSlectedAns === he.decode(data[questionIndex].correct_answer)) {
      point = 1;
    }

    const qna = questionsAndAnswers.slice();
    qna.push({
      question: he.decode(data[questionIndex].question),
      user_answer: userSlectedAns,
      correct_answer: he.decode(data[questionIndex].correct_answer),
      point,
    });

    if (questionIndex === data.length - 1) {
      return endQuiz({
        totalQuestions: data.length,
        correctAnswers: correctAnswers + point,
        timeTaken,
        questionsAndAnswers: qna,
      });
    }

    setCorrectAnswers(correctAnswers + point);
    setQuestionIndex(questionIndex + 1);
    setUserSlectedAns(null);
    setQuestionsAndAnswers(qna);
  };

  const timeOver = timeTaken => {
    return endQuiz({
      totalQuestions: data.length,
      correctAnswers,
      timeTaken,
      questionsAndAnswers,
    });
  };

  const currentQ = data[questionIndex];
  const decodedQuestion = he.decode(currentQ.question);
  const decodedCorrect = he.decode(currentQ.correct_answer);

  return (
    <Item.Header>
      <Container>
        <Segment>
          <Item.Group divided>
            <Item>
              <Item.Content>
                <Item.Extra>
                  <Header as="h1" block floated="left">
                    <Icon name="info circle" />
                    <Header.Content>
                      {`Question No.${questionIndex + 1} of ${data.length}`}
                    </Header.Content>
                  </Header>
                  <Countdown
                    countdownTime={countdownTime}
                    timeOver={timeOver}
                    setTimeTaken={setTimeTaken}
                  />
                </Item.Extra>

                <br />

                <Item.Meta>
                  <Message size="huge" floating>
                    <b>{`Q. ${decodedQuestion}`}</b>
                  </Message>

                  {showCorrect && (
                    <Message positive icon size="large">
                      <Icon name="check circle" />
                      <Message.Content>
                        <Message.Header>Răspuns corect</Message.Header>
                        {decodedCorrect}
                      </Message.Content>
                    </Message>
                  )}

                  <br />
                  <Item.Description>
                    <h3>Alege unul dintre răspunsurile de mai jos:</h3>
                  </Item.Description>
                  <Divider />

                  <Menu vertical fluid size="massive">
                    {currentQ.options.map((option, i) => {
                      const letter = getLetter(i);
                      const decodedOption = he.decode(option);
                      const isCorrect = decodedOption === decodedCorrect;
                      const isActive = userSlectedAns === decodedOption;

                      const highlightStyle =
                        showCorrect && isCorrect
                          ? { background: '#eaffea', fontWeight: 600 }
                          : undefined;

                      return (
                        <Menu.Item
                          key={`${decodedOption}-${i}`}
                          name={decodedOption}
                          active={isActive}
                          onClick={handleItemClick}
                          style={highlightStyle}
                        >
                          <b style={{ marginRight: 8 }}>{letter}</b>
                          {decodedOption}
                          {showCorrect && isCorrect && (
                            <Icon
                              name="check circle"
                              color="green"
                              style={{ marginLeft: 8 }}
                            />
                          )}
                        </Menu.Item>
                      );
                    })}
                  </Menu>
                </Item.Meta>

                <Divider />

                <Item.Extra>
                  <Button
                    basic
                    color={showCorrect ? 'grey' : 'green'}
                    content={
                      showCorrect
                        ? 'Ascunde răspunsul corect'
                        : 'Arată răspunsul corect'
                    }
                    icon={showCorrect ? 'eye slash' : 'eye'}
                    labelPosition="left"
                    onClick={() => setShowCorrect(s => !s)}
                    floated="left"
                    size="big"
                  />

                  <Button
                    primary
                    content="Next"
                    onClick={handleNext}
                    floated="right"
                    size="big"
                    icon="right chevron"
                    labelPosition="right"
                    disabled={!userSlectedAns}
                  />
                </Item.Extra>
              </Item.Content>
            </Item>
          </Item.Group>
        </Segment>
        <br />
      </Container>
    </Item.Header>
  );
};

Quiz.propTypes = {
  data: PropTypes.array.isRequired,
  countdownTime: PropTypes.number.isRequired,
  endQuiz: PropTypes.func.isRequired,
};

export default Quiz;
