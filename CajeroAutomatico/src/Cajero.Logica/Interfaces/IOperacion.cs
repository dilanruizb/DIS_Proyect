using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Logica.Interfaces
{
    public interface IOperacion
    {
        int NumeroOperacion { get; set; }
        DateTime FechaHora { get; set; }
        string Estado { get; set; }

        int IdSesion { get; set; }
        string NumeroCuenta { get; set; }

        bool ejecutar();
    }
}
