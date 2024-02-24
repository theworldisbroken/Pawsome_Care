import React, { useState } from 'react';
import '../../../layout/style/quiz.css'
// https://www.freepik.com/free-vector/flat-illustration-people-with-pets_14213069.htm#query=animal%20sitter&position=9&from_view=search&track=ais&uuid=19b53749-a2fd-44f7-b8b0-2f5933dd440e#position=9&query=animal%20sitter
import quizPic from "../../../layout/images/Quiz_pic.png"

const Quiz = () => {
  const [quiz1, setQuiz1] = useState();
  const [quiz2, setQuiz2] = useState();
  const [quiz3, setQuiz3] = useState();
  const [quiz4, setQuiz4] = useState();
  const [quiz5, setQuiz5] = useState();
  const [quiz6, setQuiz6] = useState();
  const [quiz7, setQuiz7] = useState();
  const [quiz8, setQuiz8] = useState();
  const [quiz9, setQuiz9] = useState();
  const [quiz10, setQuiz10] = useState();
  const [score, setScore] = useState(0);
  const [quiz_Submit, setQuiz_Submit] = useState(false);
  let percentage = (score * 100) / 10

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'quiz1') {
      setQuiz1(value);
    } else if (name === 'quiz2') {
      setQuiz2(value);
    } else if (name === 'quiz3') {
      setQuiz3(value);
    } else if (name === 'quiz4') {
      setQuiz4(value);
    } else if (name === 'quiz5') {
      setQuiz5(value);
    } else if (name === 'quiz6') {
      setQuiz6(value);
    } else if (name === 'quiz7') {
      setQuiz7(value);
    } else if (name === 'quiz8') {
      setQuiz8(value);
    } else if (name === 'quiz9') {
      setQuiz9(value);
    } else if (name === 'quiz10') {
      setQuiz10(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault()
    for (let i = 1; i <= 10; i++) {
      if (eval("quiz" + i) === "true") {
        setScore(prevScore => prevScore + 1);
      }
    }
    setQuiz_Submit(true)
  }

  let result
  if (percentage >= 50) {
    result = <p className='quiz-won'>Gratulation! Sie haben bestanden mit {percentage} % Genauigkeit</p>
  } else {
    result = <p className='quiz-lost'>Schade! Sie haben leider nicht bestanden mit {percentage} % Genauigkeit</p>
  }
  return (
    <div className='quiz-body'>
      <div className="quiz-container">
        <h1>Einstellungsquiz</h1>
        <h3> Herzlich Willkommen zu unserem Tiersitter Quiz</h3>
        <h3 className='start-now-text'>Testen Sie jetzt wie gut Sie geeignet sind als Haustiersitter</h3>
        <h3 className='quiz-steps'>Schritte: </h3>
        <h3 className='quiz-steps'>1. Antworten Sie auf die Fragen</h3>
        <h3 className='quiz-steps'>2. Klicken Sie auf Submit</h3>

        <div className='img-container'>
          <img className='quiz-image' alt='Pet' src={quizPic} />
        </div>
        <hr />
        <div className="quiz-content"><p>1. Was ist eine wichtige Information, die Sie vom Haustierbesitzer vor dem Sitten erhalten sollten ?</p></div>
        <div className='choices-container'>
          <input type="radio" name="quiz10" value="false1" checked={quiz10 === 'false1'} onChange={handleChange} />
          <label className="radio-label-quiz1">Lieblingsfernsehprogramme des Haustiers</label>

          <input type="radio" name="quiz10" value="false" checked={quiz10 === 'false'} onChange={handleChange} />
          <label className="radio-label-quiz1">Die bevorzugte Farbe des Haustierbetts</label>

          <input type="radio" name="quiz10" value="true" checked={quiz10 === 'true'} onChange={handleChange} />
          <label className="radio-label-quiz1">Kontaktdaten des Tierarztes</label>
        </div>
        <hr />
        <div className="quiz-content"><p>2. Was sollten Sie tun, wenn Sie während des Haustiersittings bemerken, dass das Futter für das Haustier fast aufgebraucht ist ?</p></div>
        <div className='choices-container'>
          <input type="radio" name="quiz9" value="false" checked={quiz9 === 'false'} onChange={handleChange} />
          <label className="radio-label-quiz2"> Das Futter einfach selbst nachkaufen und dem Besitzer später den Betrag erstatten</label>

          <input type="radio" name="quiz9" value="true" checked={quiz9 === 'true'} onChange={handleChange} />
          <label className="radio-label-quiz2">Den Besitzer sofort informieren und nach seinen Anweisungen handeln</label>

          <input type="radio" name="quiz9" value="false1" checked={quiz9 === 'false1'} onChange={handleChange} />
          <label className="radio-label-quiz2">Anderes Futter verwenden, das Sie bereits zu Hause haben</label>
        </div>
        <hr />
        <div className="quiz-content"><p>3. Wie oft am Tag sollte eine Katze Futter bekommen ?</p></div>
        <div className='choices-container'>
          <input type="radio" name="quiz1" value="false1" checked={quiz1 === 'false1'} onChange={handleChange} />
          <label className="radio-label-quiz3">Immer wenn sie hunger hat</label>

          <input type="radio" name="quiz1" value="false" checked={quiz1 === 'false'} onChange={handleChange} />
          <label className="radio-label-quiz3">Reicht einmal eine große Portion</label>

          <input type="radio" name="quiz1" value="true" checked={quiz1 === 'true'} onChange={handleChange} />
          <label className="radio-label-quiz3">3 x am besten und kleinere Portionen</label>
        </div>
        <hr />
        <div className="quiz-content"><p>4. Was ist zu tun, wenn Ihre Katze nicht urinieren kann ?</p></div>
        <div className='choices-container'>
          <input type="radio" name="quiz2" value="true" checked={quiz2 === 'true'} onChange={handleChange} />
          <label className="radio-label-quiz4">Direkt zum Tierarzt</label>

          <input type="radio" name="quiz2" value="false" checked={quiz2 === 'false'} onChange={handleChange} />
          <label className="radio-label-quiz4">Warmes wasser zu trinken geben</label>

          <input type="radio" name="quiz2" value="false1" checked={quiz2 === 'false1'} onChange={handleChange} />
          <label className="radio-label-quiz4">Erstmal nur beobachten</label>
        </div>
        <hr />
        <div className="quiz-content"><p>5. Der Nachbarshund kommt Ihnen entgegen, Sie ________ ?</p></div>
        <div className='choices-container'>
          <input type="radio" name="quiz3" value="true" checked={quiz3 === 'true'} onChange={handleChange} />
          <label className="radio-label-quiz5">Sie bindeen Ihren Hund lieber an die Leine</label>

          <input type="radio" name="quiz3" value="false" checked={quiz3 === 'false'} onChange={handleChange} />
          <label className="radio-label-quiz5">Sie lassen Ihren Hund einfach zu ihm rennen</label>

          <input type="radio" name="quiz3" value="false1" checked={quiz3 === 'false1'} onChange={handleChange} />
          <label className="radio-label-quiz5">Sie machen nichts, ist doch nur ein Spaziergang</label>
        </div>
        <hr />
        <div className="quiz-content"><p>6. Was kann eine mögliche Ursache für einen Durchfall bei Katzen sein ?</p></div>
        <div className='choices-container'>
          <input type="radio" name="quiz4" value="false" checked={quiz4 === 'false'} onChange={handleChange} />
          <label className="radio-label-quiz6">Die Katze war öfter draußen, man weiß nicht was sie gegessen hat</label>

          <input type="radio" name="quiz4" value="true" checked={quiz4 === 'true'} onChange={handleChange} />
          <label className="radio-label-quiz6">Kürzlich das Futter gewechselt und nicht vertragen</label>

          <input type="radio" name="quiz4" value="false1" checked={quiz4 === 'false1'} onChange={handleChange} />
          <label className="radio-label-quiz6">Die Katze hat viel Wasser getrunken</label>
        </div>
        <hr />
        <div className="quiz-content"><p>7. Die Katze wird gefüttert mit ..?</p></div>
        <div className='choices-container'>
          <input type="radio" name="quiz5" value="false1" checked={quiz5 === 'false1'} onChange={handleChange} />
          <label className="radio-label-quiz7">Natürlich mit meinem Essen</label>

          <input type="radio" name="quiz5" value="false" checked={quiz5 === 'false'} onChange={handleChange} />
          <label className="radio-label-quiz7">Jeden Tag ein anderes Gericht wie bei mir</label>

          <input type="radio" name="quiz5" value="true" checked={quiz5 === 'true'} onChange={handleChange} />
          <label className="radio-label-quiz7">Eine Marke, man sollte das Futter nicht oft wechseln</label>
        </div>
        <hr />
        <div className="quiz-content"><p>8. Ihr Hund hat die Fernbedienung zerkaut, was machen Sie ?</p></div>
        <div className='choices-container'>
          <input type="radio" name="quiz6" value="true" checked={quiz6 === 'true'} onChange={handleChange} />
          <label className="radio-label-quiz8">Ihm zeigen was er getan hat</label>

          <input type="radio" name="quiz6" value="false" checked={quiz6 === 'false'} onChange={handleChange} />
          <label className="radio-label-quiz8">Kein Futter für heute geben</label>

          <input type="radio" name="quiz6" value="false1" checked={quiz6 === 'false1'} onChange={handleChange} />
          <label className="radio-label-quiz8">Anschimpfen, damit er es nie wieder tut</label>
        </div>
        <hr />
        <div className="quiz-content"><p>9. Ihr Hund bellt immer wenn Sie nicht Zuhause sind, was wäre eine mögliche Lösung ?</p></div>
        <div className='choices-container'>
          <input type="radio" name="quiz7" value="false1" checked={quiz7 === 'false1'} onChange={handleChange} />
          <label className="radio-label-quiz9">Ihm mehr Futter lassen</label>

          <input type="radio" name="quiz7" value="false" checked={quiz7 === 'false'} onChange={handleChange} />
          <label className="radio-label-quiz9">Nichts machen</label>

          <input type="radio" name="quiz7" value="true" checked={quiz7 === 'true'} onChange={handleChange} />
          <label className="radio-label-quiz9">Ich frage jemanden der ihn einmal am Tag besucht wenn du nicht zuhause sein kannst</label>
        </div>
        <hr />
        <div className="quiz-content"><p>10. Ihre Katze hustet öfter, was könnte die Lösung sein ?</p></div>
        <div className='choices-container'>
          <input type="radio" name="quiz8" value="true" checked={quiz8 === 'true'} onChange={handleChange} />
          <label className="radio-label-quiz10">Ich gehe lieber zum Tierarzt</label>

          <input type="radio" name="quiz8" value="false" checked={quiz8 === 'false'} onChange={handleChange} />
          <label className="radio-label-quiz10">Ist nicht schlimm, ich mache nichts </label>

          <input type="radio" name="quiz8" value="false1" checked={quiz8 === 'false1'} onChange={handleChange} />
          <label className="radio-label-quiz10">Ich gebe ihr warmes Wasser zu trinken</label>
        </div>

        {!quiz_Submit && <button className='quiz-btn' type="submit" onClick={handleSubmit} >submit</button>}
        {quiz_Submit && <button className='quiz-btn' type="submit" onClick={handleSubmit} disabled>submit</button>}
        {quiz_Submit && result}
      </div>
      <div className="credits-footer-quiz">
        <a href="https://www.freepik.com/free-vector/flat-illustration-people-with-pets_14213069.htm#query=animal%20sitter&position=9&from_view=search&track=ais&uuid=19b53749-a2fd-44f7-b8b0-2f5933dd440e#position=9&query=animal%20sitter" target="_blank">Bild von Freepik</a>
      </div>
    </div>
  );
};

export default Quiz;