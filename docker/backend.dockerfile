FROM ${BASE_IMAGE:-quay.io/centos/centos:stream8}

RUN dnf -y update \
 && dnf -y install \
    dnf-plugins-core \
    epel-release \
    glibc-langpack-en \
 && dnf config-manager --set-enabled powertools \
 && dnf -y module enable nodejs:14 \
 && dnf -y install \
    make \
    gcc-c++ \
    nodejs \
    python3-devel \
    R \
 && dnf clean all

RUN mkdir /server

WORKDIR /server

COPY server/install.R .

RUN Rscript install.R

COPY server/package.json .

RUN npm install

COPY server .

CMD npm start



