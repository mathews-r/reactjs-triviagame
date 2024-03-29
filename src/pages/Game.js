import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BiTimer } from 'react-icons/bi';
import { Redirect } from 'react-router-dom';
import Header from '../components/Header';
import { fetchTrivia } from '../services';
import { questions, score } from '../redux/actions';
import '../styles/game.css';

class Game extends Component {
  constructor() {
    super();
    this.state = {
      checkTrivia: false,
      buttonCorrect: '',
      buttonIncorrect: '',
      timer: 30,
      desactiveButton: false,
      nextQuestion: 0,
    };
  }

  componentDidMount() {
    this.getQuestions();
    this.tempo();
  }

  addStyle = () => {
    this.setState({
      buttonCorrect: 'btn btn-success',
      buttonIncorrect: 'btn btn-danger',
      desactiveButton: true,
    });
    clearInterval(this.timerID);
    clearTimeout(this.clearId);
  };

 tempo = () => {
   const SECONDS = 1000;
   const trintaSeconds = 30000;
   this.timerID = setInterval(() => {
     this.setState((prevState) => ({ timer: prevState.timer - 1 }));
   }, SECONDS);
   this.clearId = setTimeout(() => {
     this.addStyle();
     clearInterval(this.timerID);
   }, trintaSeconds);
 };

  getScore = (dificuldade) => {
    const { scoreDispatch } = this.props;
    const { timer } = this.state;
    let pontos = 0;
    const numberThree = 3;
    const numberTen = 10;
    if (dificuldade === 'easy') {
      pontos = 1;
    } else if (dificuldade === 'medium') {
      pontos = 2;
    } else {
      pontos = numberThree;
    }
    const pontuacao = numberTen + (timer * pontos);
    scoreDispatch(pontuacao);
  }

  getQuestions = async () => {
    const { saveTrivia } = this.props;
    const result = await fetchTrivia(localStorage.getItem('token'));
    const number05 = 0.5;
    if (result.response_code === 0) {
      this.setState({
        checkTrivia: false,
      });
    } else {
      this.setState({
        checkTrivia: true,
      });
    }
    const resultMap = result.results.map((elem) => ({
      ...elem,
      incorrect_answers: [...elem.incorrect_answers, elem.correct_answer].sort(
        () => Math.random() - number05,
      ),
    }));
    saveTrivia(resultMap);
  };

  next = () => {
    const { nextQuestion } = this.state;
    const { history } = this.props;
    const number04 = 4;
    if (nextQuestion < number04) {
      this.setState((prevState) => ({
        timer: 30,
        nextQuestion: prevState.nextQuestion + 1,
        desactiveButton: false,
        buttonCorrect: '',
        buttonIncorrect: '',
      }), this.tempo());
    } else {
      history.push('/feedback');
    }
  }

  render() {
    const { checkTrivia,
      buttonCorrect, buttonIncorrect, timer, desactiveButton, nextQuestion } = this.state;
    const { questoes } = this.props;
    return (
      <>
        <Header />
        <main className="main-game">
          {checkTrivia ? (
            <Redirect to="/" />
          ) : (
            questoes.map((elem, index) => (
              <div className="div-perguntas" key={ `Perguntas ${index}` }>
                <p>{`Question ${index + 1}`}</p>
                <div className="div-questions">
                  <p data-testid="question-category">{elem.category}</p>
                  <p data-testid="question-text">{elem.question}</p>

                </div>
                <p data-testid="p-timer">
                  {`TIME:  ${timer}`}
                  {' '}
                  <BiTimer />
                </p>
                <div className="div-buttons-game">
                  {elem.type === 'boolean'
                    ? elem.incorrect_answers.map((values) => (
                      <div
                        key={ `respostas booleanas ${values} ${index}` }
                        data-testid="answer-options"
                      >
                        {elem.correct_answer === values ? (
                          <button
                            type="button"
                            disabled={ desactiveButton }
                            className={ `${buttonCorrect} button-questions` }
                            data-testid="correct-answer"
                            onClick={ () => {
                              this.addStyle();
                              this.getScore(elem.difficulty);
                            } }
                          >
                            {values}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={ desactiveButton }
                            className={ `${buttonIncorrect} button-questions` }
                            data-testid={ `wrong-answer-${index}` }
                            onClick={ this.addStyle }
                          >
                            {values}
                          </button>
                        )}
                      </div>
                    ))
                    : elem.incorrect_answers.map((newValues) => (
                      <div
                        key={ `respostas múltiplas ${newValues} ${index}` }
                        data-testid="answer-options"
                      >
                        {elem.correct_answer === newValues ? (
                          <button
                            type="button"
                            disabled={ desactiveButton }
                            className={ `${buttonCorrect} button-questions` }
                            data-testid="correct-answer"
                            onClick={ () => {
                              this.addStyle();
                              this.getScore(elem.difficulty);
                            } }
                          >
                            {newValues}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={ desactiveButton }
                            className={ `${buttonIncorrect} button-questions` }
                            data-testid={ `wrong-answer-${index}` }
                            onClick={ this.addStyle }
                          >
                            {newValues}
                          </button>
                        )}
                      </div>
                    ))}
                  { desactiveButton && (
                    <button
                      type="button"
                      className="button-next btn btn-secondary"
                      data-testid="btn-next"
                      onClick={ this.next }
                    >
                      Next

                    </button>)}
                </div>
              </div>
            ))[nextQuestion]
          )}

        </main>
      </>
    );
  }
}

Game.propTypes = {
  questoes: PropTypes.array,
  saveTrivia: PropTypes.func,
}.isRequired;

const mapStateToProps = (state) => ({
  questoes: state.player.questions,

});

const mapDispatchToProps = (dispatch) => ({
  saveTrivia: (trivia) => dispatch(questions(trivia)),
  scoreDispatch: (pontuacao) => dispatch(score(pontuacao)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Game);
