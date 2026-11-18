using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Domain.Interfaces
{
    public interface IExtraccion : IOperacion
    {
        decimal Monto { get; set; }
        decimal SaldoRestante { get; set; }
    }
}
