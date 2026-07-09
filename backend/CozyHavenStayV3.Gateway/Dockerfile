FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 7100

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CozyHavenStayV3.Gateway/CozyHavenStayV3.Gateway.csproj", "CozyHavenStayV3.Gateway/"]
RUN dotnet restore "CozyHavenStayV3.Gateway/CozyHavenStayV3.Gateway.csproj"
COPY . .
WORKDIR "/src/CozyHavenStayV3.Gateway"
RUN dotnet build "CozyHavenStayV3.Gateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CozyHavenStayV3.Gateway.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CozyHavenStayV3.Gateway.dll"]