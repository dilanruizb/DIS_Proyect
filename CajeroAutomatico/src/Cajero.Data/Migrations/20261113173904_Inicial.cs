using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cajero.Data.Migrations
{
    /// <inheritdoc />
    public partial class Inicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clientes",
                columns: table => new
                {
                    IdCliente = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Apellido = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clientes", x => x.IdCliente);
                });

            migrationBuilder.CreateTable(
                name: "Cuentas",
                columns: table => new
                {
                    NumeroCuenta = table.Column<string>(type: "TEXT", nullable: false),
                    Cbu = table.Column<string>(type: "TEXT", nullable: false),
                    SaldoTotal = table.Column<long>(type: "INTEGER", nullable: false),
                    SaldoDisponible = table.Column<long>(type: "INTEGER", nullable: false),
                    LimiteDiario = table.Column<long>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cuentas", x => x.NumeroCuenta);
                });

            migrationBuilder.CreateTable(
                name: "Tarjetas",
                columns: table => new
                {
                    Numero = table.Column<string>(type: "TEXT", nullable: false),
                    FechaVencimiento = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Bloqueada = table.Column<bool>(type: "INTEGER", nullable: false),
                    EntidadEmisora = table.Column<string>(type: "TEXT", nullable: false),
                    IdCliente = table.Column<int>(type: "INTEGER", nullable: false),
                    NumeroCuenta = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tarjetas", x => x.Numero);
                    table.ForeignKey(
                        name: "FK_Tarjetas_Clientes_IdCliente",
                        column: x => x.IdCliente,
                        principalTable: "Clientes",
                        principalColumn: "IdCliente",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tarjetas_Cuentas_NumeroCuenta",
                        column: x => x.NumeroCuenta,
                        principalTable: "Cuentas",
                        principalColumn: "NumeroCuenta",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Credenciales",
                columns: table => new
                {
                    NumeroTarjeta = table.Column<string>(type: "TEXT", nullable: false),
                    SalPin = table.Column<byte[]>(type: "BLOB", nullable: false),
                    HashPin = table.Column<byte[]>(type: "BLOB", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Credenciales", x => x.NumeroTarjeta);
                    table.ForeignKey(
                        name: "FK_Credenciales_Tarjetas_NumeroTarjeta",
                        column: x => x.NumeroTarjeta,
                        principalTable: "Tarjetas",
                        principalColumn: "Numero",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Sesiones",
                columns: table => new
                {
                    IdSesion = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FechaHoraInicio = table.Column<DateTime>(type: "TEXT", nullable: false),
                    FechaHoraFin = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Autenticada = table.Column<bool>(type: "INTEGER", nullable: false),
                    IntentosPIN = table.Column<int>(type: "INTEGER", nullable: false),
                    Estado = table.Column<int>(type: "INTEGER", nullable: false),
                    IdCliente = table.Column<int>(type: "INTEGER", nullable: false),
                    NumeroTarjeta = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sesiones", x => x.IdSesion);
                    table.ForeignKey(
                        name: "FK_Sesiones_Clientes_IdCliente",
                        column: x => x.IdCliente,
                        principalTable: "Clientes",
                        principalColumn: "IdCliente",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Sesiones_Tarjetas_NumeroTarjeta",
                        column: x => x.NumeroTarjeta,
                        principalTable: "Tarjetas",
                        principalColumn: "Numero",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Operaciones",
                columns: table => new
                {
                    NumeroOperacion = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FechaHora = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Estado = table.Column<string>(type: "TEXT", nullable: false),
                    IdSesion = table.Column<int>(type: "INTEGER", nullable: false),
                    NumeroCuenta = table.Column<string>(type: "TEXT", nullable: false),
                    TipoOperacion = table.Column<string>(type: "TEXT", maxLength: 13, nullable: false),
                    SaldoTotal = table.Column<long>(type: "INTEGER", nullable: true),
                    SaldoDisponible = table.Column<long>(type: "INTEGER", nullable: true),
                    Monto = table.Column<long>(type: "INTEGER", nullable: true),
                    SaldoRestante = table.Column<long>(type: "INTEGER", nullable: true),
                    Transferencia_Monto = table.Column<long>(type: "INTEGER", nullable: true),
                    CbuDestino = table.Column<string>(type: "TEXT", nullable: true),
                    NumeroComprobante = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Operaciones", x => x.NumeroOperacion);
                    table.ForeignKey(
                        name: "FK_Operaciones_Cuentas_NumeroCuenta",
                        column: x => x.NumeroCuenta,
                        principalTable: "Cuentas",
                        principalColumn: "NumeroCuenta",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Operaciones_Sesiones_IdSesion",
                        column: x => x.IdSesion,
                        principalTable: "Sesiones",
                        principalColumn: "IdSesion",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cuentas_Cbu",
                table: "Cuentas",
                column: "Cbu",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Operaciones_IdSesion",
                table: "Operaciones",
                column: "IdSesion");

            migrationBuilder.CreateIndex(
                name: "IX_Operaciones_NumeroCuenta",
                table: "Operaciones",
                column: "NumeroCuenta");

            migrationBuilder.CreateIndex(
                name: "IX_Sesiones_IdCliente",
                table: "Sesiones",
                column: "IdCliente");

            migrationBuilder.CreateIndex(
                name: "IX_Sesiones_NumeroTarjeta",
                table: "Sesiones",
                column: "NumeroTarjeta");

            migrationBuilder.CreateIndex(
                name: "IX_Tarjetas_IdCliente",
                table: "Tarjetas",
                column: "IdCliente");

            migrationBuilder.CreateIndex(
                name: "IX_Tarjetas_NumeroCuenta",
                table: "Tarjetas",
                column: "NumeroCuenta");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Credenciales");

            migrationBuilder.DropTable(
                name: "Operaciones");

            migrationBuilder.DropTable(
                name: "Sesiones");

            migrationBuilder.DropTable(
                name: "Tarjetas");

            migrationBuilder.DropTable(
                name: "Clientes");

            migrationBuilder.DropTable(
                name: "Cuentas");
        }
    }
}
