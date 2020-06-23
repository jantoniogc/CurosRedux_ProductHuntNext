import React, {useState, useEffect} from 'react';

const useValidacion = (stateIncial, validar, fn) => {

  const [valores, setValores] = useState(stateIncial);
  const [errores, setErrores] = useState({});
  const [submitForm, setSubmitForm] = useState(false);

  useEffect(() => {
    if (submitForm) {
      const noErrores = Object.keys(errores).length === 0;
      if (noErrores) {
        fn(); // Fn = Función que se ejecuta en el componente
      }
      setSubmitForm(false);
    }
  }, [submitForm])

  // función que se ejecuta cuando el suuario escribe algo
  const handlerChange = (e) => {
    setValores({
      ...valores,
      [e.target.name] : e.target.value
    })
  }

  // función que se ehecuta cuando el usuario hace submit
  const handlerSubmit = (e) => {
    e.preventDefault();
    const erroresValidacion = validar(valores);
    setErrores(erroresValidacion);
    setSubmitForm(true);
  }

  // cuando se realizar el evento de blur
  const handlerBlur = () => {
    const erroresValidacion = validar(valores);
    setErrores(erroresValidacion);
  }

  return {
    valores,
    errores,
    handlerSubmit,
    handlerChange,
    handlerBlur
  };
}
 
export default useValidacion;