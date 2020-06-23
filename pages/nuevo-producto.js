import React, { useState, useContext } from 'react';
import { css } from '@emotion/core';
import Router, { useRouter } from 'next/router';
import FileUploader from 'react-firebase-file-uploader';
import Layout from '../components/layout/Layout';
import { Formulario, Campo, InputSubmit, Error } from '../components/ui/Formulario';


import { FirebaseContext } from '../firebase';

import Error404 from '../components/layout/404';

// validaciones
import useValidacion from '../hooks/useValidacion';
import validarCrearProducto from '../validacion/validarCrearProducto';

const STATE_INICIAL = {
  nombre: '',
  empresa: '',
  imagen: '',
  url: '',
  descripcion: ''
}

const NuevoProducto = () => {

  // state de las imagenes
  const [nombreimagen, setNombre] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [urlimagen, setUrlImagen] = useState('');

  const [error, setError] = useState(false);

  const { valores, errores, handlerSubmit, handlerChange, handlerBlur } = useValidacion(STATE_INICIAL, validarCrearProducto, crearProducto);

  const { nombre, empresa, imagen, url, descripcion } = valores;

  // hook de routing para redireccionar
  const router = useRouter();

  // context con las operaciones crud de firebase
  const { usuario, firebase } = useContext(FirebaseContext);

  async function crearProducto() {

    // si el usuario no esta autenticado llevar al login
    if (!usuario) {
      return router.push('/login');
    }

    // crear el objeto de nuevo producto 
    const producto = {
      nombre,
      empresa,
      url,
      urlimagen,
      descripcion,
      votos: 0,
      comentarios: [],
      creado: Date.now(),
      creador: {
        id: usuario.uid,
        nombre: usuario.displayName
      },
      haVotado: []
    }

    // insertarlo en la base de datos
    firebase.db.collection('productos').add(producto);

    return router.push('/');

  }


  const handleUploadStart = () => {
    setProgreso(0);
    setSubiendo(true);
  }

  const handleProgress = progreso => setProgreso({ progreso });

  const handleUploadError = error => {
    setSubiendo(error);
    console.error(error);
  };

  const handleUploadSuccess = nombre => {
    setProgreso(100);
    setSubiendo(false);
    setNombre(nombre)
    firebase
      .storage
      .ref("productos")
      .child(nombre)
      .getDownloadURL()
      .then(url => {
        console.log(url);
        setUrlImagen(url);
      });
  };

  return (
    <div>
      <Layout>
        {!usuario ? <Error404 /> : (
          <>
            <h1
              css={css`
                text-align: center;
                margin-top: 5rem;
              `}
            >Nuevo Producto</h1>
            <Formulario
              noValidate
              onSubmit={handlerSubmit}
            >

              <fieldset>
                <legend>Información General </legend>

                <Campo>
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    type="text"
                    id="nombre"
                    placeholder="Nombre del Producto"
                    name="nombre"
                    value={nombre}
                    onChange={handlerChange}
                    onBlur={handlerBlur}
                  />
                </Campo>

                <Campo>
                  <label htmlFor="empresa">Empresa</label>
                  <input
                    type="text"
                    id="empresa"
                    placeholder="Nombre Empresa o Compañia"
                    name="empresa"
                    value={empresa}
                    onChange={handlerChange}
                    onBlur={handlerBlur}
                  />
                </Campo>

                {errores.empresa && <Error>{errores.empresa}</Error>}

                <Campo>
                  <label htmlFor="imagen">Imagen</label>
                  <FileUploader
                    accept="image/*"
                    id="imagen"
                    name="imagen"
                    randomizeFilename
                    storageRef={firebase.storage.ref("productos")}
                    onUploadStart={handleUploadStart}
                    onUploadError={handleUploadError}
                    onUploadSuccess={handleUploadSuccess}
                    onProgress={handleProgress}
                  />
                </Campo>
                <Campo>
                  <label htmlFor="url">URL</label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    placeholder="URL de tu producto"
                    value={url}
                    onChange={handlerChange}
                    onBlur={handlerBlur}
                  />
                </Campo>

                {errores.url && <Error>{errores.url}</Error>}

              </fieldset>

              <fieldset>
                <legend>Sobre tu Producto</legend>

                <Campo>
                  <label htmlFor="descripcion">Descripcion</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={descripcion}
                    onChange={handlerChange}
                    onBlur={handlerBlur}
                  />
                </Campo>
              </fieldset>


              <InputSubmit
                type="submit"
                value="Crear Producto"
              />
            </Formulario>
          </>
        )}

      </Layout>
    </div>
  )
}

export default NuevoProducto