using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Domain.Enums
{
    public enum EstadoSesion
    {
        Iniciada,
        Autenticando,
        Validando,
        Operando,
        Cerrando,
        Cerrada
    }
}
